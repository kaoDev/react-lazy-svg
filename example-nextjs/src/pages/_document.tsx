import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { IconsCache, SpriteContextProvider } from 'react-lazy-svg';
import { renderSpriteSheetToString } from 'react-lazy-svg/dist/ssr';
import { readSvg } from '../serverLoadSvg';

type Props = {
  sessionIcons: IconsCache;
};

export default class DocumentWithCriticalIcons extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const sessionIcons: IconsCache = new Map();

    const result = await ctx.renderPage({
      enhanceApp: (App) => {
        return (props) => (
          <SpriteContextProvider loadSVG={readSvg} knownIcons={sessionIcons}>
            <App {...props} />
          </SpriteContextProvider>
        );
      },
    });

    result.html = await renderSpriteSheetToString(result.html, sessionIcons);

    return result;
  }

  render(): JSX.Element {
    return (
      <Html lang={this.props.locale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
