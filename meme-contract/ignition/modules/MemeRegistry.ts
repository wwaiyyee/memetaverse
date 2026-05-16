import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MemeRegistryModule = buildModule("MemeRegistryModule", (m) => {
  const memeRegistry = m.contract("MemeRegistry");
  return { memeRegistry };
});

export default MemeRegistryModule;
