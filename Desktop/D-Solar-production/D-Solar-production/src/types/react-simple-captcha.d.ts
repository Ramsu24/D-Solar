declare module 'react-simple-captcha' {
  /**
   * Loads the captcha engine
   * @param numberOfCharacters - The number of characters to display in the captcha
   * @param foregroundColor - Foreground color of the captcha
   * @param backgroundColor - Background color of the captcha
   * @param charType - The type of characters to use ('upper', 'lower', 'numeric', 'alpha', 'alphanumeric')
   */
  export function loadCaptchaEnginge(
    numberOfCharacters?: number,
    foregroundColor?: string,
    backgroundColor?: string,
    charType?: 'upper' | 'lower' | 'numeric' | 'alpha' | 'alphanumeric'
  ): void;

  /**
   * Validates the entered captcha against the generated one
   * @param userCaptchaValue - The captcha value entered by the user
   */
  export function validateCaptcha(userCaptchaValue: string): boolean;

  /**
   * Component that renders the captcha canvas
   */
  export function LoadCanvasTemplate(): JSX.Element;

  /**
   * Component that renders the captcha in a smaller container
   */
  export function LoadCanvasTemplateNoReload(): JSX.Element;
} 