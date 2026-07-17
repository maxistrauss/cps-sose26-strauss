import { useState } from "react";
import HomePage from "./pages/HomePage";
import OverviewHome from "./pages/overview/overview_home";
import PaymentHome from "./pages/payment/payment_home";
import PaymentPrice from "./pages/payment/payment_price";
import AdminHome from "./pages/admin/admin_home";

type View = "home" | "overview" | "payment" | "payment-price" | "admin";

function App() {
  const [view, setView] = useState<View>("home");
  const [selectedPlate, setSelectedPlate] = useState("");

  if (view === "overview") {
    return <OverviewHome onBack={() => setView("home")} />;
  }

  if (view === "admin") {
    return <AdminHome onBack={() => setView("home")} />;
  }

  if (view === "payment-price") {
    return (
      <PaymentPrice
        plate={selectedPlate}
        onBack={() => setView("payment")}
        onPaymentFinished={() => setView("payment")}
      />
    );
  }

  if (view === "payment") {
    return (
      <PaymentHome
        onBack={() => setView("home")}
        onContinue={(plate) => {
          setSelectedPlate(plate);
          setView("payment-price");
        }}
      />
    );
  }

  return (
    <HomePage
      onSelectDashboard={(dashboardId) => {
        if (dashboardId === "overview") setView("overview");
        if (dashboardId === "payment")  setView("payment");
        if (dashboardId === "admin")    setView("admin");
      }}
    />
  );
}

export default App;
