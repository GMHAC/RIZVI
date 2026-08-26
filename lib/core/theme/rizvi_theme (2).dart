import 'package:flutter/material.dart';

class RizviTheme {
  static const background = Color(0xFF07080A);
  static const surface = Color(0xFF101216);
  static const surface2 = Color(0xFF15171C);
  static const navy = Color(0xFF09234A);
  static const redRose = Color(0xFFE4001B);
  static const yellowRose = Color(0xFFFFC400);
  static const green = Color(0xFF22C55E);

  static ThemeData dark() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: redRose,
        brightness: Brightness.dark,
        surface: surface,
      ),
      fontFamily: 'Roboto',
      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: surface.withOpacity(.92),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: Colors.white.withOpacity(.07)),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF090A0D),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
    );
  }

  static Color accentFor(String theme) {
    switch (theme) {
      case 'rose_red': return redRose;
      case 'rose_yellow': return yellowRose;
      case 'safety': return const Color(0xFF16A36A);
      case 'quality': return const Color(0xFF6D63FF);
      case 'production': return const Color(0xFF3B82F6);
      default: return const Color(0xFF64748B);
    }
  }
}
