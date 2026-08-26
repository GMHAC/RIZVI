import 'dart:convert';
import 'package:http/http.dart' as http;
import 'config_service.dart';

class SyncService {
  final ConfigService configService;
  final String baseUrl;

  SyncService({
    required this.configService,
    required this.baseUrl,
  });

  Future<Map<String, dynamic>> fetchLatestConfig() async {
    if (baseUrl.trim().isEmpty) {
      return configService.loadLocalConfig();
    }

    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/dashboard/config'),
      headers: {'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Dashboard sync failed: ${response.statusCode}');
    }

    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
