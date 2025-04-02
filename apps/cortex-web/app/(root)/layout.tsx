import "@jonathanramlie/neuron/design-tokens/base.scss";
import "./index.scss";

const DefaultLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default DefaultLayout;
