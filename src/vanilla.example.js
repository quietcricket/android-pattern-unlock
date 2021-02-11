import { h, app } from "hyperapp";

import { OptionsGroup } from "./example-helpers/Options";
import CodeExample from "./example-helpers/CodeExample";
import PatternLockCanvas from "./example-helpers/PatternLockCanvas";

import { component } from "./example-helpers/component";

const App = component({
  state: {
    gridIndex: 1,
    themeIndex: 0,
    themeStateIndex: 0,
    password: "",
    showControls: false,
    width: 300,
    height: 430,
  },
  actions: {
    setGrid: gridIndex => () => ({ gridIndex }),
    setTheme: themeIndex => () => ({ themeIndex }),
    setThemeState: themeStateIndex => () => ({ themeStateIndex }),
    setPassword: password => () => ({ password }),
    setDimensions: dimens => () => {
      return dimens;
    },
    toggleControls: () => ({ showControls }) => ({ showControls: !showControls }),
  },
  render: ({ grids, themes, themeStates }) => (state, actions) =>
    h("div", {}, [
      h(
        "div",
        { class: "canvas-wrapper" },
        h(PatternLockCanvas, {
          width: state.width,
          height: state.height,
          onComplete: ({ password }) => {
            if (!password) return;
            let mapping = [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ];
            let seq = "";
            password = JSON.parse(password);
            for (let p of password) {
              seq += mapping[p.col - 1][p.row - 1];
            }
            let args = new URLSearchParams(document.location.search);
            let correctPassword = args.get("p");
            if (!correctPassword) {
              correctPassword = "541236987";
            }
            if (seq == correctPassword) {
              actions.setThemeState(1);
              let canvas = document.querySelector(".canvas-wrapper");
              canvas.style.opacity = 0;
              let phone = document.querySelector(".phone");
              phone.style.opacity = 1;
              phone.style.filter = "blur(0px)";
              setTimeout(() => {
                let url = args.get("redirect");
                if (!url) url = "https://docs.google.com/presentation/d/1pj-KKm_ww2Yachdb39DFbon6FQzH_fYSaSeDbTOXg3g";
                document.location.href = url;
              }, 5000);
            } else {
              actions.setThemeState(2);
            }
          },
          grid: grids[state.gridIndex],
          theme: themes[state.themeIndex],
          themeState: themeStates[state.themeStateIndex],
        })
      ),
      h("div", { class: "password", style: "display:none" }, ["Generated hash: ", h("input", { value: state.password })]),
      h(
        "button",
        {
          onclick: actions.toggleControls,
          class: "button-primary",
          style: "display:none",
        },
        `${state.showControls ? "Hide" : "Show"} Controls`
      ),
      !state.showControls
        ? null
        : h("div", { class: "controls-wrapper" }, [
            h(CodeExample, {
              config: {
                width: state.width,
                height: state.height,
                grid: grids[state.gridIndex],
                theme: themes[state.themeIndex],
              },
            }),
            h("div", { style: { padding: "1em .3em" } }, [
              h(OptionsGroup, {
                name: "Grid",
                list: grids,
                selected: state.gridIndex,
                onItemSelect: index => () => actions.setGrid(index),
              }),
              h(OptionsGroup, {
                name: "Theme",
                list: themes,
                selected: state.themeIndex,
                onItemSelect: index => () => actions.setTheme(index),
              }),
              h(OptionsGroup, {
                name: "Theme State",
                list: themeStates,
                selected: state.themeStateIndex,
                onItemSelect: index => () => actions.setThemeState(index),
              }),
            ]),
          ]),
      h("div", { style: { padding: "5em" } }),
    ]),
});

document.addEventListener("DOMContentLoaded", () => {
  const { state, actions } = App.instance;
  const view = h(App, {
    grids: [
      [2, 2],
      [3, 3],
      [3, 4],
      [4, 4],
      [4, 5],
    ],
    themes: ["dark", "light"],
    themeStates: ["default", "success", "failure"],
  });

  app(state, actions, view, document.getElementById("root"));
  window.dispatchEvent(new Event("resize"));
});
