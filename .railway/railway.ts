import { defineRailway, project, service } from "railway/iac";

// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "birthday-generator";

export default defineRailway(() => {
  const birthday_generator = service("birthday-generator", {
    build: "npm run build",
    start: "npm run start",
    // builder from CaC: "NIXPACKS"
  });
  return project("birthday-generator", {
    resources: [birthday_generator],
  });
});
