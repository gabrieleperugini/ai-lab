import { useMemo } from "react";
import { RouterProvider, useRoute } from "./lib/router";
import { readClassroomMode } from "./lib/classMode";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./components/layout/HomePage";
import { DayPage } from "./components/layout/DayPage";
import { ModulePage } from "./components/layout/ModulePage";

function Pages() {
  const route = useRoute();
  const mode = useMemo(() => readClassroomMode(), []);

  return (
    <AppShell mode={mode}>
      {route.page === "home" && <HomePage />}
      {route.page === "day" && <DayPage dayId={route.dayId} mode={mode} />}
      {route.page === "module" && (
        <ModulePage
          dayId={route.dayId}
          moduleId={route.moduleId}
          extra={route.extra}
          mode={mode}
        />
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <Pages />
    </RouterProvider>
  );
}
