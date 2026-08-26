import 'package:flutter/material.dart';
import '../models/dashboard_models.dart';
import '../theme/rizvi_theme.dart';

class DynamicWidget extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;

  const DynamicWidget({
    super.key,
    required this.config,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    switch (config.type) {
      case 'kpi':
        return _KpiCard(config: config, accent: accent);
      case 'progress':
        return _ProgressCard(config: config, accent: accent);
      case 'list':
        return _ListCard(config: config, accent: accent);
      case 'bar':
        return _BarCard(config: config, accent: accent);
      case 'alert':
        return _AlertCard(config: config, accent: accent);
      case 'timeline':
        return _TimelineCard(config: config, accent: accent);
      default:
        return _KpiCard(config: config, accent: accent);
    }
  }
}

class _KpiCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _KpiCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            CircleAvatar(
              radius: 25,
              backgroundColor: accent.withOpacity(.12),
              child: Icon(Icons.insights_rounded, color: accent),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(config.title,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(config.value ?? '--',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: accent,
                      )),
                  if (config.unit != null)
                    Text(config.unit!,
                        style: const TextStyle(color: Colors.black54)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _ProgressCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    final raw = double.tryParse(config.value ?? '0') ?? 0;
    final progress = (raw / 100).clamp(0.0, 1.0);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(config.title,
                style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 12,
                color: accent,
                backgroundColor: accent.withOpacity(.10),
              ),
            ),
            const SizedBox(height: 10),
            Text('${raw.toStringAsFixed(0)}%',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  color: accent,
                )),
          ],
        ),
      ),
    );
  }
}

class _ListCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _ListCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(config.title,
                style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            ...config.data.take(6).map(
              (e) => ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.check_circle_rounded,
                    size: 19, color: accent),
                title: Text(e.toString()),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BarCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _BarCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    final values = config.data.whereType<Map>().toList();
    final max = values.isEmpty
        ? 1.0
        : values.map((e) => (e['value'] as num?)?.toDouble() ?? 0)
            .fold<double>(1, (a, b) => a > b ? a : b);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(config.title,
                style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            ...values.map((e) {
              final label = e['label']?.toString() ?? '';
              final value = (e['value'] as num?)?.toDouble() ?? 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    SizedBox(width: 92, child: Text(label)),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: value / max,
                          minHeight: 10,
                          color: accent,
                          backgroundColor: accent.withOpacity(.10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    SizedBox(width: 45, child: Text(value.toStringAsFixed(0))),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _AlertCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _AlertCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.orange.withOpacity(.07),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            const Icon(Icons.warning_amber_rounded,
                color: Colors.orange, size: 32),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(config.title,
                      style: const TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text(config.status ?? 'Review required'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimelineCard extends StatelessWidget {
  final WidgetConfig config;
  final Color accent;
  const _TimelineCard({required this.config, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(config.title,
                style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            ...config.data.map(
              (e) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 7),
                child: Row(
                  children: [
                    Icon(Icons.circle, size: 9, color: accent),
                    const SizedBox(width: 10),
                    Expanded(child: Text(e.toString())),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
