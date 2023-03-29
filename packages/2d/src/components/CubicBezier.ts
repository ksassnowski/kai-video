import {useLogger} from '@motion-canvas/core/lib/utils';
import {CubicBezierSegment} from '../curves';
import {PolynomialSegment} from '../curves/PolynomialSegment';
import {computed} from '../decorators';
import {bezierCurveTo, lineTo, moveTo} from '../utils';
import {Bezier, BezierOverlayInfo} from './Bezier';
import {LineProps} from './Line';

/**
 * A node for drawing a cubic Bézier curve.
 *
 * @remarks
 * A cubic Bézier curve is defined by exactly four points. These points can
 * either be provided via the {@link points} property or by providing the correct
 * number of child nodes to this node. When child nodes are provided, the
 * position of the curve's control points is determined by the positions of the
 * child nodes.
 *
 * @example
 * Defining a cubic Bézier curve using `points` property.
 *
 * ```tsx
 * <CubicBezier
 *   lineWidth={4}
 *   stroke={'lightseagreen'}
 *   points={[
 *     [-200, -200],
 *     [100, -200],
 *     [-100, 200],
 *     [200, 200],
 *   ]}
 * />
 * ```
 *
 * Defining a cubic Bézier curve by providing child nodes.
 *
 * ```tsx
 * <CubicBezier lineWidth={4} stroke={'lightseagreen'}>
 *   <Circle position={[-200, -200]} />
 *   <Circle position={[100, -200]} />
 *   <Circle position={[-100, -200]} />
 *   <Circle position={[200, 200]} />
 * </CubicBezier>
 * ```
 */
export class CubicBezier extends Bezier {
  @computed()
  protected segment(): PolynomialSegment {
    const points = this.parsedPoints();
    return new CubicBezierSegment(points[0], points[1], points[2], points[3]);
  }

  protected overlayInfo(matrix: DOMMatrix): BezierOverlayInfo {
    const [p0, p1, p2, p3] = this.segment().transformPoints(matrix);

    const curvePath = new Path2D();
    moveTo(curvePath, p0);
    bezierCurveTo(curvePath, p1, p2, p3);

    const handleLinesPath = new Path2D();
    moveTo(handleLinesPath, p0);
    lineTo(handleLinesPath, p1);
    moveTo(handleLinesPath, p2);
    lineTo(handleLinesPath, p3);

    return {
      curve: curvePath,
      startPoint: p0,
      endPoint: p3,
      controlPoints: [p1, p2],
      handleLines: handleLinesPath,
    };
  }

  protected override validateProps(props: LineProps): void {
    if (
      (props.children === undefined || props.children.length != 4) &&
      (props.points === undefined || props.points.length != 4) &&
      props.spawner === undefined
    ) {
      useLogger().warn({
        message:
          'Incorrect number of points provided to cubic Bézier curve. Needs exactly four points.',
        remarks: 'This line sucks, yo',
        inspect: this.key,
      });
    }
  }
}
