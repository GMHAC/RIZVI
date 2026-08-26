class DashboardConfig {
  final String id;
  final String title;
  final String department;
  final String subtitle;
  final String theme;
  final List<WidgetConfig> widgets;

  DashboardConfig({
    required this.id,
    required this.title,
    required this.department,
    required this.subtitle,
    required this.theme,
    required this.widgets,
  });

  factory DashboardConfig.fromJson(Map<String, dynamic> json) {
    return DashboardConfig(
      id: json['id'] as String,
      title: json['title'] as String,
      department: json['department'] as String,
      subtitle: json['subtitle'] as String? ?? '',
      theme: json['theme'] as String? ?? 'corporate',
      widgets: (json['widgets'] as List<dynamic>? ?? [])
          .map((e) => WidgetConfig.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class WidgetConfig {
  final String id;
  final String type;
  final String title;
  final String? value;
  final String? unit;
  final String? status;
  final List<dynamic> data;
  final int span;

  WidgetConfig({
    required this.id,
    required this.type,
    required this.title,
    this.value,
    this.unit,
    this.status,
    this.data = const [],
    this.span = 1,
  });

  factory WidgetConfig.fromJson(Map<String, dynamic> json) {
    return WidgetConfig(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      value: json['value']?.toString(),
      unit: json['unit']?.toString(),
      status: json['status']?.toString(),
      data: json['data'] as List<dynamic>? ?? const [],
      span: (json['span'] as num?)?.toInt() ?? 1,
    );
  }
}
