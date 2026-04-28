const STORAGE_KEY = "genstudio-e2e:selected-experience";
const PANEL_MODE_KEY = "genstudio-e2e:validation-panel-mode";

export type SelectedExperiencePayload = {
  experienceId: string;
  updatedAt: number;
};

export type ValidationPanelMode = "mlr" | "create-validation";

export function publishSelectedExperience(experienceId: string) {
  const payload: SelectedExperiencePayload = {
    experienceId,
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(
    new CustomEvent("genstudio-e2e:selected-experience", {
      detail: payload,
    }),
  );
}

export function readSelectedExperience(): SelectedExperiencePayload | null {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SelectedExperiencePayload;
  } catch {
    return null;
  }
}

export function subscribeToSelectedExperience(
  onChange: (payload: SelectedExperiencePayload) => void,
) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      onChange(JSON.parse(event.newValue) as SelectedExperiencePayload);
    } catch {
      // Ignore malformed bridge payloads.
    }
  };

  const onCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<SelectedExperiencePayload>;
    if (customEvent.detail) {
      onChange(customEvent.detail);
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("genstudio-e2e:selected-experience", onCustomEvent);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(
      "genstudio-e2e:selected-experience",
      onCustomEvent,
    );
  };
}

export function publishValidationPanelMode(mode: ValidationPanelMode) {
  window.localStorage.setItem(PANEL_MODE_KEY, mode);
  window.dispatchEvent(
    new CustomEvent("genstudio-e2e:validation-panel-mode", {
      detail: mode,
    }),
  );
}

export function readValidationPanelMode(): ValidationPanelMode {
  const mode = window.localStorage.getItem(PANEL_MODE_KEY);
  return mode === "create-validation" ? "create-validation" : "mlr";
}

export function subscribeToValidationPanelMode(
  onChange: (mode: ValidationPanelMode) => void,
) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PANEL_MODE_KEY || !event.newValue) {
      return;
    }
    onChange(event.newValue === "create-validation" ? "create-validation" : "mlr");
  };

  const onCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<ValidationPanelMode>;
    if (customEvent.detail) {
      onChange(customEvent.detail === "create-validation" ? "create-validation" : "mlr");
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("genstudio-e2e:validation-panel-mode", onCustomEvent);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(
      "genstudio-e2e:validation-panel-mode",
      onCustomEvent,
    );
  };
}