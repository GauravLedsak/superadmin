import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "./store/StoreContext.jsx";
import { Layout } from "./layout/Layout.jsx";

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Layout />
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
