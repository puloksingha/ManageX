import AppShell from "./AppShell";

const DashboardLayout = ({ title, children }) => {
  return <AppShell title={title}>{children}</AppShell>;
};

export default DashboardLayout;
