import 'package:flutter/material.dart';
import 'core/services/config_service.dart';
import 'core/services/sync_service.dart';
import 'core/theme/rizvi_theme.dart';
import 'screens/app_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final configService = ConfigService();
  final config = await configService.loadLocalConfig();

  // Set this to your FastAPI endpoint in production.
  const apiBaseUrl = String.fromEnvironment(
    'RIZVI_API_BASE_URL',
    defaultValue: '',
  );

  final syncService = SyncService(
    configService: configService,
    baseUrl: apiBaseUrl,
  );

  runApp(RizviApp(
    initialConfig: config,
    syncService: syncService,
  ));
}

class RizviApp extends StatelessWidget {
  final Map<String, dynamic> initialConfig;
  final SyncService syncService;

  const RizviApp({
    super.key,
    required this.initialConfig,
    required this.syncService,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RIZVI-MANAGEMENT',
      debugShowCheckedModeBanner: false,
      theme: RizviTheme.dark(),
      home: AppShell(
        initialConfig: initialConfig,
        syncService: syncService,
      ),
    );
  }
}
