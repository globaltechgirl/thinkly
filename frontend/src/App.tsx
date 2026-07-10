import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import "@/App.css";
import router from "@/router/routes";
import { persistor, store } from "@/store/store";
import { theme, variablesResolver } from "@/utils/mantine-theme";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MantineProvider theme={theme} cssVariablesResolver={variablesResolver}>
          <Notifications zIndex={100000} position="top-right" />
          <RouterProvider router={router} />
        </MantineProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;