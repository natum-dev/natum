import AppProvider from "@/lib/providers/typo-meter/AppProvider";
import "@natum/ui/design-tokens/base.scss";
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
          <main className={styles.main}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
};

export default TypewriterLayout;
