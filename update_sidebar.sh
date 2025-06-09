#!/bin/bash

# Ajouter EnvelopeIcon aux imports
sed -i '' 's/ClockIcon,/ClockIcon,\'$'\n  EnvelopeIcon,/' src/components/dashboard/EventSidebar.tsx

# Ajouter Communication après Analytique dans la navigation
sed -i '' '/icon: PresentationChartLineIcon,/a\
    },\
    { \
      name: "Communication", \
      href: `${baseUrl}/communication`, \
      icon: EnvelopeIcon,
' src/components/dashboard/EventSidebar.tsx 