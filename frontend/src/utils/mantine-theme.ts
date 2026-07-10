import {
    createTheme,
    MantineThemeOverride,
    CSSVariablesResolver,
} from "@mantine/core";

export const theme: MantineThemeOverride = createTheme({
    colors: {
        primary: [
            "#e7f1ff",
            "#b8d5ff",
            "#88baff",
            "#589eff",
            "#3589ff",
            "#3589ff",
            "#1174ff",
            "#0a5dcc",
            "#074699",
            "#052e66",
        ],
        dark: [
            "#a1a2a2",
            "#868787",
            "#6c6c6c",
            "#515152",
            "#262628",
            "#262628",
            "#0f0f0f",
            "#171717",
            "#171717",
            "#0f0f0f",
        ],
    },
});

export const variablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: {
        "--mantine-color-body": "#ffffff",
        "--mantine-color-text": "#1E1E1E80",
    },
    dark: {
        "--mantine-color-body": "#000000",
        "--mantine-color-text": "#1E1E1E80",
    },
});