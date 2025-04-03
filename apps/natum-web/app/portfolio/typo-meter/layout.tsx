import AppProvider from "@/lib/providers/typo-meter/AppProvider";
import { Container } from "@natum/natum-ui";
import "@natum/natum-ui/design-tokens/base.scss";
import styles from "./layout.module.scss";

const TypewriterLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body data-theme="dark">
        <AppProvider>
          <Container type="main" className={styles.main}>
            {children}
          </Container>
        </AppProvider>
      </body>
    </html>
  );
};

export default TypewriterLayout;
