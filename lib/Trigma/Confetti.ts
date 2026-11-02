import JSConfetti from 'js-confetti'

export class Confetti {
  private static jsConfetti: JSConfetti | undefined

  public celebrate(): void {
    if (
      typeof window === 'undefined' ||
      typeof window.CanvasRenderingContext2D === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    Confetti.jsConfetti ??= new JSConfetti()
    void Confetti.jsConfetti.addConfetti()
  }
}
