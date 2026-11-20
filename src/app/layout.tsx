import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";

export const metadata = { title: "EMJ Exclusive | Customer Insights" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
