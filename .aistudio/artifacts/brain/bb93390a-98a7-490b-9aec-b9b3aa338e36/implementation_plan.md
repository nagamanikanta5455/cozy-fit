# Implementation Plan: Weekday-Aligned 52-Week Heatmap & Robust Scroll Timing

Revise the activity density grid architecture to eliminate weekday staggering, guarantee initial scroll positioning to the current date, and prevent timezone shift errors.

---

## Technical Audit & Key Architectural Defenses

### 1. Weekday Alignment Architecture (7-Day Column Invariant)
- **The Pitfall:** Generating a naive 365-day array creates fractional weeks (365 / 7 = 52.14 weeks). The grid row labels ("Mon", "Wed", "Fri") will be offset by 1–2 days, resulting in Tuesday landing on the "Monday" row.
- **The Architectural Fix:**
  - The grid is strictly generated column-by-column in full 7-day increments:
    1. Calculate `endWeekSunday = getWeekEnd(today)`.
    2. Calculate `currentWeekMonday = getWeekStart(today)`.
    3. Calculate `startWeekMonday = addDaysToISODate(currentWeekMonday, -51 * 7)`. (If user has historical workouts older than 52 weeks, expand back to `getWeekStart(earliestWorkoutDate)`).
    4. For every week from `startWeekMonday` to `endWeekSunday`, generate exactly 7 cells from Monday (index 0) to Sunday (index 6).
  - Every column has exactly 7 cells. Row 0 is always Monday, Row 2 is always Wednesday, Row 4 is always Friday. No staggering.

---

### 2. Scroll Timing & Paint Coordination
- **The Pitfall:** Calling `scrollLeft = scrollWidth` inside a basic `useEffect` or unbuffered effect can execute before the browser finishes calculating the 1,000px+ grid dimensions, leaving the viewport stuck on the far left (oldest date).
- **The Architectural Fix:**
  - Coordinate scroll positioning using a combined `useLayoutEffect` and `requestAnimationFrame` + `setTimeout(..., 50)` sequence:
    ```typescript
    useLayoutEffect(() => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const scrollToToday = () => {
        if (el) el.scrollLeft = el.scrollWidth;
      };

      // Immediate attempt before paint
      scrollToToday();

      // Guarded attempt after layout reflow
      const rafId = requestAnimationFrame(() => {
        scrollToToday();
      });

      // Final fallback after all subcomponents mount
      const timer = setTimeout(scrollToToday, 50);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
    }, [allWeeks.length]);
    ```
  - This ensures that whether the grid takes 2ms or 30ms to calculate layout, the viewport always lands cleanly on the current week.

---

### 3. Timezone-Safe Date Math (Zero UTC Drift)
- **The Pitfall:** `new Date("YYYY-MM-DD")` parses to UTC midnight (`00:00:00Z`). In timezones west of UTC (e.g. UTC-5 EST or UTC-8 PST), this shifts back to the previous calendar day (`23:00` or `16:00`). Late-night workouts logged at 11:30 PM can accidentally jump across day boundaries.
- **The Architectural Fix:**
  - Continue leveraging CozyFit's localized `dates.ts` utilities:
    - `parseISODate(iso)` breaks strings into `[year, month - 1, day]` and instantiates local midnight `new Date(year, month, day, 0, 0, 0, 0)`.
    - `toISODate(date)` uses local getters `getFullYear()`, `getMonth()`, and `getDate()`.
    - `addDaysToISODate` and `getWeekStart`/`getWeekEnd` guarantee invariant Monday-to-Sunday intervals regardless of Daylight Saving Time (DST) transitions.

---

## Component Updates

### 1. `src/domain/history.ts`
- Enhance `buildHeatmapWeeks(workouts: Workout[], today: ISODate, minWeeks: number = 52)`:
  - Generate full 7-day Monday–Sunday weeks.
  - Days with no logged activity are assigned `intensity: 0`, `count: 0`, `minutes: 0`, rendering themed empty placeholder tiles (`var(--heat-0)`).
  - Current week days after `today` are marked `isFuture: true` with dashed border.
  - Today is tagged `isToday: true` with the active focus ring.

### 2. `src/pages/JourneyPage.tsx`
- Bind `buildHeatmapWeeks(workouts, today, 52)` to provide a complete 52-week baseline.
- Implement the robust `requestAnimationFrame` + `setTimeout` scroll-to-end mechanism.
- Set container CSS to `flex-1 overflow-x-auto min-w-0 pb-3`.
- Wire `ChevronLeft` and `ChevronRight` buttons to smoothly scroll 8 weeks (`8 * 20px = 160px`) in either direction.

---

## Verification Plan

### Automated Verification
- Run `npm test` to ensure all 35 domain test suites pass.
- Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
- Run `compile_applet` (`npm run build`) to ensure build artifacts compile without warnings.

### Visual & Interactive Acceptance Checks
1. **Weekday Row Invariant:** Inspect the top row of the grid across all 52 weeks—every cell is a Monday. Row index 2 is Wednesday, Row index 4 is Friday.
2. **Initial Viewport Position:** On loading `/ #journey`, the grid immediately opens scrolled to the far right, displaying today's highlighted active cell (Nov 10, 2026).
3. **Chevron Scrolling:** Clicking `<` scrolls smoothly to the left by 8 weeks. Clicking `>` scrolls smoothly to the right back toward the current week.
4. **Empty State Display:** All 51 past weeks show dark/neutral placeholder tiles for rest days.
