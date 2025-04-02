import AppProvider from "@/lib/providers/typo-meter/AppProvider";
import { Container } from "@natum/natum-ui";
import "@natum/natum-ui/design-tokens/base.scss";
import styles from "./base.module.scss";

const TypewriterLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <AppProvider>
      <Container type="main" className={styles.main}>
        {children}
      </Container>
    </AppProvider>
  );
};

export default TypewriterLayout;
