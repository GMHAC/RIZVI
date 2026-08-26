import 'package:flutter/material.dart';
import '../core/models/dashboard_models.dart';
import '../core/theme/rizvi_theme.dart';
import '../core/widgets/dynamic_widget.dart';
import '../core/widgets/rose_watermark.dart';

class DynamicDashboard extends StatelessWidget {
  final DashboardConfig dashboard;
  const DynamicDashboard({super.key, required this.dashboard});

  @override
  Widget build(BuildContext context) {
    final accent = RizviTheme.accentFor(dashboard.theme);
    final width = MediaQuery.of(context).size.width;
    final columns = width >= 1400 ? 4 : width >= 900 ? 3 : 1;
    final isRose = dashboard.theme == 'rose_red' || dashboard.theme == 'rose_yellow';

    return Stack(
      children: [
        if (isRose)
          Positioned.fill(
            child: Center(child: RoseWatermark(color: accent, size: width > 1200 ? 640 : 460, opacity: .16)),
          ),
        Positioned.fill(
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.05, -0.12),
                  radius: 1.0,
                  colors: [accent.withOpacity(.055), Colors.transparent],
                ),
              ),
            ),
          ),
        ),
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 20, 22, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HeroHeader(dashboard: dashboard, accent: accent),
              const SizedBox(height: 18),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: dashboard.widgets.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: columns == 1 ? 2.35 : 1.72,
                ),
                itemBuilder: (context, index) => DynamicWidget(config: dashboard.widgets[index], accent: accent),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroHeader extends StatelessWidget {
  final DashboardConfig dashboard;
  final Color accent;
  const _HeroHeader({required this.dashboard, required this.accent});

  @override
  Widget build(BuildContext context) {
    final rose = dashboard.theme == 'rose_red' || dashboard.theme == 'rose_yellow';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1014).withOpacity(.94),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accent.withOpacity(.30)),
        boxShadow: [BoxShadow(color: accent.withOpacity(.12), blurRadius: 28)],
      ),
      child: Row(
        children: [
          if (rose) ...[
            RoseWatermark(color: accent, size: 62, opacity: .95),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('RIZVI-MANAGEMENT', style: TextStyle(color: accent, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: .4)),
              const SizedBox(height: 3),
              Text(dashboard.title, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
              const SizedBox(height: 5),
              Text(dashboard.subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
            ]),
          ),
          const SizedBox(width: 16),
          const Icon(Icons.cloud_done_rounded, color: Color(0xFF22C55E), size: 20),
          const SizedBox(width: 7),
          const Text('ALL SYSTEMS OPERATIONAL', style: TextStyle(color: Color(0xFF22C55E), fontSize: 10, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
