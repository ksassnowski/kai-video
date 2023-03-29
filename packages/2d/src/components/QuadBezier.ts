import {useLogger} from '@motion-canvas/core/lib/utils';
import {QuadBezierSegment} from '../curves';
import {PolynomialSegment} from '../curves/PolynomialSegment';
import {computed} from '../decorators';
import {lineTo, moveTo, quadraticCurveTo} from '../utils';
import {Bezier, BezierOverlayInfo} from './Bezier';
import {LineProps} from './Line';

/**
 * A node for drawing a quadratic Bézier curve.
 *
 * @remarks
 * A quadratic Bézier curve is defined by exactly three points. These points can
 * either be provided via the {@link points} property or by providing the correct
 * number of child nodes to this node. When child nodes are provided, the
 * position of the curve's control points is determined by the positions of the
 * child nodes.
 *
 * @example
 * Defining a quadratic Bézier curve using `points` property.
 *
 * ```tsx
 * <QuadBezier
 *   lineWidth={4}
 *   stroke={'lightseagreen'}
 *   points={[
 *     [-200, 0],
 *     [0, -200],
 *     [200, 0],
 *   ]}
 * />
 * ```
 *
 * Defining a cubic Bézier curve by providing child nodes.
 *
 * ```tsx
 * <QuadBezier lineWidth={4} stroke={'lightseagreen'}>
 *   <Circle position={[-200, 0]} />
 *   <Circle position={[0, -200]} />
 *   <Circle position={[200, 0]} />
 * </CubicBezier>
 * ```
 */
export class QuadBezier extends Bezier {
  protected segment(): PolynomialSegment {
    const points = this.parsedPoints();
    return new QuadBezierSegment(points[0], points[1], points[2]);
  }

  @computed()
  protected overlayInfo(matrix: DOMMatrix): BezierOverlayInfo {
    const [p0, p1, p2] = this.segment().transformPoints(matrix);

    const curvePath = new Path2D();
    moveTo(curvePath, p0);
    quadraticCurveTo(curvePath, p1, p2);

    const handleLinesPath = new Path2D();
    moveTo(handleLinesPath, p0);
    lineTo(handleLinesPath, p1);
    lineTo(handleLinesPath, p2);

    return {
      curve: curvePath,
      startPoint: p0,
      endPoint: p2,
      controlPoints: [p1],
      handleLines: handleLinesPath,
    };
  }

  protected override validateProps(props: LineProps): void {
    if (
      (props.children === undefined || props.children.length != 3) &&
      (props.points === undefined || props.points.length != 3) &&
      props.spawner === undefined
    ) {
      useLogger().warn({
        message:
          'Incorrect number of points provided to quadratic Bézier curve. Needs exactly three points.',
        remarks: 'This line sucks, yo',
        inspect: this.key,
      });
    }
  }
}
