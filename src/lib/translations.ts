export type Lang = "en" | "es";

export const t = {
  en: {
    nav: {
      feed: "Feed",
      ask: "Ask the Economist",
      myEconomy: "My Economy",
      saved: "Saved",
    },
    auth: {
      signIn: "Sign In",
      signOut: "Sign out",
      editProfile: "Edit Profile",
    },
    feed: {
      backToFeed: "Back to feed",
      whatHappened: "What happened",
      whyItHappened: "Why it happened",
      economistTake: "The Economist's Take",
      sources: "Sources",
      watch: "Watch",
      relatedEvents: "Related Events",
      highImpact: "HIGH IMPACT",
      mediumImpact: "MEDIUM IMPACT",
      lowImpact: "LOW IMPACT",
    },
    onboarding: {
      step1: "Do you rent or own your home?",
      step2: "What's your employment situation?",
      step3: "What are your biggest financial concerns?",
      step3sub: "Select all that apply — you can have more than one.",
      step4: "Where are you based?",
      step4sub: "We'll highlight economic events reexport type Lang = "en" | "es";

expoceholder: "e.g. Boston, Chicago, Austin...",
      step4skip: "Skip for now",
      step5: "Which best describes where you are in life?",
      step5sub: "This helps us focus on what matters most at your stage.",
      step6: "Do you carry any of these types of debt?",
      step6sub: "Select all that apply — this shapes how interest rate changes affect you personally.",
      step7: "What industry do you work in?",
      step7sub: "Different sectors are hit differently by economic shifts — layoffs, AI, tariffs, and policy don't affect everyone equally.",
      continue: "Continue",
      back: "Back",
      finish: "Finish",
      saving: "Saving…",
    },
    ask: {
      placeholder: "Ask anything about the economy...",
      send: "Send",
      limit: "You've reached your daily limit.",
    },
  },
  es: {
    nav: {
      feed: "Noticias",
      ask: "Pregunta al Economista",
      myEconomy: "Mi Economía",
      saved: "Guardado",
    },
    auth: {
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
      editProfile: "Editar Perfil",
    },
    feed: {
      backToFeed: "Volver al feed",
      whatHappened: "Qué pasó",
      whyItHappened: "Por qué pasó",
      economistTake: "La opinión del Economista",
      sources: "Fuentes",
      watch: "Ver",
      relatedEvents: "Eventos relacionados",
      highImpact: "ALTO IMPACTO",
      mediumImpact: "IMPACTO MEDIO",
      lowImpact: "BAJO IMPACTO",
    },
    onboarding: {
      step1: "¿Alquilas o tienes tu propia vivienda?",
      step2: "¿Cuál es tu situación laboral?",
      step3: "¿Cuáles son tus mayores preocupaciones financieras?",
      step3sub: "Selecciona todas las que apliquen — puedes tener más de una.",
      step4: "¿Dónde vives?",
      step4sub: "Destacaremos eventos económicos relevantes para tu área.",
      step4placeholder: "ej. Miami, Nueva York, Los Ángeles...",
      step4skip: "Saltar por ahora",
      step5: "¿Cuál describe mejor tu etapa de vida?",
      step5sub: "Esto nos ayuda a enfocarnos en lo que más importa en tu etapa.",
      step6: "¿Tienes alguno de estos tipos de deuda?",
      step6sub: "Selecciona todos los que apliquen — esto define cómo los cambios en tasas de interés te afectan.",
      step7: "¿En qué industria trabajas?",
      step7sub: "Los cambios económicos afectan a cada sector de manera diferente — despidos, IA, aranceles y políticas no afectan a todos por igual.",
      continue: "Continuar",
      back: "Atrás",
      finish: "Finalizar",
      saving: "Guardando…",
    },
    ask: {
      placeholder: "Pregunta cualquier cosa sobre la economía...",
      send: "Enviar",
      limit: "Has alcanzado tu límite diario.",
    },
  },
} as const;

export function useTranslations(lang: Lang) {
  return t[lang];
}
