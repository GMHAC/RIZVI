import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;

import '../models/dashboard_models.dart';

class ConfigService {
  Future<Map<String, dynamic>> loadLocalConfig() async {
    final raw = await rootBundle.loadString('lib/config/dashboard_config.json');
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  List<DashboardConfig> dashboardsFrom(Map<String, dynamic> config) {
    final items = config['dashboards'] as List<dynamic>? ?? [];
    return items
        .map((e) => DashboardConfig.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
