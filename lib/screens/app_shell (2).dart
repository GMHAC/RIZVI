import 'package:flutter/material.dart';
import '../core/models/dashboard_models.dart';
import '../core/services/config_service.dart';
import '../core/services/sync_service.dart';
import '../core/theme/rizvi_theme.dart';
import '../core/widgets/rose_watermark.dart';
import 'dynamic_dashboard.dart';

class AppShell extends StatefulWidget {
  final Map<String, dynamic> initialConfig;
  final SyncService syncService;
  const AppShell({super.key, required this.initialConfig, required this.syncService});
  @override State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  late Map<String, dynamic> config;
  late List<DashboardConfig> dashboards;
  int selected = 0;
  bool syncing = false;

  @override void initState() { super.initState(); config = widget.initialConfig; _rebuild(); }
  void _rebuild() { dashboards = ConfigService().dashboardsFrom(config); if (selected >= dashboards.length) selected = 0; }

  Future<void> _sync() async {
    setState(() => syncing = true);
    try {
      final latest = await widget.syncService.fetchLatestConfig();
      setState(() { config = latest; _rebuild(); });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('RIZVI-MANAGEMENT synchronized successfully.')));
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sync unavailable — local configuration retained.')));
    } finally { if (mounted) setState(() => syncing = false); }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 850;
    return Scaffold(
      backgroundColor: RizviTheme.background,
      appBar: AppBar(
        title: const Row(children: [
          RoseWatermark(color: RizviTheme.redRose, size: 30, opacity: 1),
          SizedBox(width: 8),
          Text('RIZVI-MANAGEMENT', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: .3)),
        ]),
        actions: [
          const Icon(Icons.security_rounded, size: 17, color: Colors.white54),
          const SizedBox(width: 6),
          const Text('SECURE SYSTEM', style: TextStyle(color: Colors.white54, fontSize: 10)),
          const SizedBox(width: 14),
          if (syncing) const Padding(padding: EdgeInsets.symmetric(horizontal: 18), child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)))
          else IconButton(tooltip: 'Real-time synchronize', onPressed: _sync, icon: const Icon(Icons.sync_rounded)),
        ],
      ),
      drawer: isWide ? null : _drawer(),
      body: Row(children: [
        if (isWide) SizedBox(width: 285, child: _drawer()),
        Expanded(child: dashboards.isEmpty ? const Center(child: Text('No dashboard configuration found.')) : DynamicDashboard(dashboard: dashboards[selected])),
      ]),
      bottomNavigationBar: const _SystemFooter(),
    );
  }

  Widget _drawer() => Material(
    color: const Color(0xFF0A0B0E),
    child: SafeArea(
      child: ListView(padding: const EdgeInsets.fromLTRB(12, 14, 12, 14), children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(.06))),
          child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('RIZVI-MANAGEMENT', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900)),
            SizedBox(height: 4), Text('INTEGRATED MANAGEMENT & BUSINESS INTELLIGENCE SYSTEM', style: TextStyle(color: Colors.white38, fontSize: 8)),
            SizedBox(height: 4), Text('RIZVI FASHIONS LTD.', style: TextStyle(color: RizviTheme.redRose, fontSize: 10, fontWeight: FontWeight.w800)),
          ]),
        ),
        const SizedBox(height: 12),
        ...List.generate(dashboards.length, (i) {
          final d = dashboards[i]; final accent = RizviTheme.accentFor(d.theme);
          return ListTile(
            selected: selected == i,
            selectedTileColor: accent.withOpacity(.14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: selected == i ? accent.withOpacity(.35) : Colors.transparent)),
            leading: Icon(_iconFor(d.department), color: selected == i ? accent : Colors.white54),
            title: Text(d.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
            subtitle: Text(d.department, style: const TextStyle(fontSize: 9, color: Colors.white38)),
            onTap: () { setState(() => selected = i); if (Navigator.of(context).canPop()) Navigator.of(context).pop(); },
          );
        }),
      ]),
    ),
  );

  IconData _iconFor(String department) {
    final d = department.toLowerCase();
    if (d.contains('security')) return Icons.security_rounded;
    if (d.contains('fire')) return Icons.local_fire_department_rounded;
    if (d.contains('hr')) return Icons.people_alt_rounded;
    if (d.contains('quality')) return Icons.verified_rounded;
    if (d.contains('production')) return Icons.factory_rounded;
    if (d.contains('procurement')) return Icons.shopping_cart_rounded;
    if (d.contains('finance') || d.contains('accounts')) return Icons.account_balance_rounded;
    if (d.contains('maintenance')) return Icons.build_rounded;
    if (d.contains('store')) return Icons.inventory_2_rounded;
    if (d.contains('welfare')) return Icons.volunteer_activism_rounded;
    if (d.contains('audit')) return Icons.fact_check_rounded;
    return Icons.dashboard_rounded;
  }
}

class _SystemFooter extends StatelessWidget {
  const _SystemFooter();
  @override Widget build(BuildContext context) => Container(
    height: 32,
    padding: const EdgeInsets.symmetric(horizontal: 18),
    decoration: const BoxDecoration(color: Color(0xFF090A0D), border: Border(top: BorderSide(color: Colors.white10))),
    child: const Row(children: [
      Text('✦  SECURE SYSTEM', style: TextStyle(color: Colors.white54, fontSize: 9)), SizedBox(width: 25),
      Text('↻  REAL-TIME SYNC', style: TextStyle(color: Colors.white54, fontSize: 9)), SizedBox(width: 25),
      Text('▣  DATA ENCRYPTED', style: TextStyle(color: Colors.white54, fontSize: 9)), SizedBox(width: 25),
      Text('◉  AUTO BACKUP', style: TextStyle(color: Colors.white54, fontSize: 9)), Spacer(),
      Text('RIZVI-MANAGEMENT • v2.1', style: TextStyle(color: Colors.white38, fontSize: 9)),
    ]),
  );
}
