import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export type Settings = {
  numberOfInstances: number;
  viewSensitive: boolean;
  instanced: boolean;
  minAnimationInterval: number;
  maxAnimationInterval: number;
  maxDistance: number;
};

export function setupGUI(test: (settings: Settings) => void) {
  const settings: Settings = {
    numberOfInstances: 100,
    viewSensitive: false,
    instanced: false,
    minAnimationInterval: 30,
    maxAnimationInterval: 100,
    maxDistance: 140,
  };

  test(settings);

  const gui = new GUI();

  gui.add(
    {
      test: () => test(settings),
    },
    "test"
  );

  gui.add(settings, "numberOfInstances", 100, 2000, 250);
  gui.add(settings, "instanced");
  gui.add(settings, "viewSensitive").onChange(() => {
    if (settings.viewSensitive) {
      viewSensitiveFolder.open();
    } else {
      viewSensitiveFolder.close();
    }
  });

  const viewSensitiveFolder = gui.addFolder("View Sensitive");
  viewSensitiveFolder.add(settings, "minAnimationInterval", 1, 1000, 1);
  viewSensitiveFolder.add(settings, "maxAnimationInterval", 1, 1000, 1);
  viewSensitiveFolder.add(settings, "maxDistance", 1, 1000, 10);
  viewSensitiveFolder.close();
}
