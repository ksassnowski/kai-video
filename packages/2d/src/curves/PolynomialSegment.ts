import {Segment} from './Segment';
import {Vector2} from '@motion-canvas/core/lib/types';
import {UniformPolynomialCurveSampler} from './UniformPolynomialCurveSampler';
import {moveTo} from '../utils';
import {Polynomial2D} from './Polynomial2D';
import {CurvePoint} from './CurvePoint';

export abstract class PolynomialSegment extends Segment {
  protected readonly pointSampler: UniformPolynomialCurveSampler;

  public get arcLength(): number {
    return this.length;
  }

  public abstract get points(): Vector2[];

  protected constructor(
    protected readonly curve: Polynomial2D,
    protected readonly length: number,
  ) {
    super();
    this.pointSampler = new UniformPolynomialCurveSampler(this);
  }

  /**
   * Evaluate the polynomial at the given t value.
   *
   * @param t - The t value at which to evaluate the curve.
   */
  public eval(t: number): CurvePoint {
    return {
      position: this.curve.eval(t),
      tangent: this.tangent(t),
    };
  }

  /**
   * Split the curve into two separate polynomials at the given t value. The two
   * resulting curves form the same overall shape as the original curve.
   *
   * @param t - The t value at which to split the curve.
   */
  public abstract split(t: number): [PolynomialSegment, PolynomialSegment];

  public getPoint(distance: number): CurvePoint {
    const closestPoint = this.pointSampler.pointAtDistance(
      this.arcLength * distance,
    );
    return {position: closestPoint.position, tangent: closestPoint.tangent};
  }

  public transformPoints(matrix: DOMMatrix): Vector2[] {
    return this.points.map(point => point.transformAsPoint(matrix));
  }

  /**
   * Return the tangent of the point that sits at the provided t value on the
   * curve.
   *
   * @param t - The t value at which to evaluate the curve.
   */
  public tangent(t: number): Vector2 {
    return this.curve.evalDerivative(t).normalized;
  }

  public draw(
    context: CanvasRenderingContext2D | Path2D,
    start = 0,
    end = 1,
    move = true,
  ): [Vector2, Vector2, Vector2, Vector2] {
    let curve: PolynomialSegment | null = null;
    let startT = start;
    let endT = end;
    let points = this.points;

    if (start !== 0 || end !== 1) {
      const startDistance = this.length * start;
      const endDistance = this.length * end;

      startT = this.pointSampler.distanceToT(startDistance);
      endT = this.pointSampler.distanceToT(endDistance);
      endT = (endT - startT) / (1 - startT);

      const [, startSegment] = this.split(startT);
      [curve] = startSegment.split(endT);
      points = curve.points;
    }

    if (move) {
      moveTo(context, points[0]);
    }
    (curve ?? this).doDraw(context);

    return [
      points[0],
      this.tangent(startT),
      points.at(-1)!,
      this.tangent(endT),
    ];
  }

  protected abstract doDraw(context: CanvasRenderingContext2D | Path2D): void;
}
