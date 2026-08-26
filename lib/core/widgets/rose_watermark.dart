import 'dart:math' as math;
import 'package:flutter/material.dart';

class RoseWatermark extends StatelessWidget {
  final Color color;
  final double size;
  final double opacity;
  const RoseWatermark({super.key, required this.color, this.size = 520, this.opacity = .12});

  @override
  Widget build(BuildContext context) => IgnorePointer(
    child: Opacity(opacity: opacity, child: CustomPaint(size: Size.square(size), painter: _RosePainter(color))),
  );
}

class _RosePainter extends CustomPainter {
  final Color color;
  _RosePainter(this.color);
  @override
  void paint(Canvas canvas, Size s) {
    final c = Offset(s.width / 2, s.height * .39);
    final r = s.width * .27;
    final petal = Paint()..color = color..style = PaintingStyle.fill;
    for (int i = 0; i < 14; i++) {
      final a = i * math.pi * 2 / 14;
      final p = Offset(c.dx + math.cos(a) * r * .48, c.dy + math.sin(a) * r * .48);
      canvas.save();
      canvas.translate(p.dx, p.dy);
      canvas.rotate(a + math.pi / 2);
      canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: r * .62, height: r * 1.08), petal);
      canvas.restore();
    }
    final inner = Paint()..color = color.withOpacity(.72);
    for (int i = 0; i < 9; i++) {
      final a = i * math.pi * 2 / 9 + .25;
      final p = Offset(c.dx + math.cos(a) * r * .25, c.dy + math.sin(a) * r * .25);
      canvas.save();
      canvas.translate(p.dx, p.dy);
      canvas.rotate(a + math.pi / 2);
      canvas.drawOval(Rect.fromCenter(center: Offset.zero, width: r * .38, height: r * .72), inner);
      canvas.restore();
    }
    canvas.drawCircle(c, r * .12, Paint()..color = color);
    final stem = Paint()..color = const Color(0xFF3F8F48).withOpacity(.60)..strokeWidth = s.width * .028..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(c.dx, c.dy + r * .75), Offset(c.dx, s.height * .91), stem);
    final leaf = Paint()..color = const Color(0xFF3F8F48).withOpacity(.48);
    final path = Path()
      ..moveTo(c.dx, s.height * .73)
      ..quadraticBezierTo(c.dx - s.width * .30, s.height * .60, c.dx - s.width * .08, s.height * .82)
      ..quadraticBezierTo(c.dx - s.width * .02, s.height * .77, c.dx, s.height * .73);
    canvas.drawPath(path, leaf);
  }
  @override
  bool shouldRepaint(covariant _RosePainter oldDelegate) => oldDelegate.color != color;
}
