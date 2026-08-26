"""
Management command: python manage.py seed_rizviworld
Loads the same 15 Department / 39 Section / 247 Designation structure
used by the RIZVIWORLD_ROOT_INDEX.html frontend, so API data matches the UI.
"""
from django.core.management.base import BaseCommand
from rizviworld.models import Department, Section, Designation

DEPARTMENTS = [
    "Cutting Department", "Sewing / Production Department", "Finishing Department",
    "Quality Assurance (QA/QC)", "Merchandising", "Planning & Industrial Engineering (IE)",
    "Human Resources (HR)", "Compliance Department", "Store & Inventory",
    "Maintenance & Engineering", "Washing & Dyeing", "Printing & Embroidery",
    "Sample & Development", "Security", "Administration & Finance",
]

SECTION_MAP = [
    (1, ["Fabric Inspection", "Cutting", "Numbering & Bundling"]),
    (2, ["Sewing Line A", "Sewing Line B", "Sewing Line C", "Input/Output Control"]),
    (3, ["Thread Trimming", "Ironing / Pressing", "Get-up & Tagging"]),
    (4, ["Inline QC", "Endline QC", "Final Inspection (AQL)"]),
    (5, ["Order Management", "Costing & Sourcing"]),
    (6, ["Production Planning", "Industrial Engineering", "Line Balancing"]),
    (7, ["Recruitment", "Employee Relations", "Payroll & Attendance"]),
    (8, ["Social Compliance", "Safety & Fire"]),
    (9, ["Fabric Store", "Accessories Store", "Finished Goods Store"]),
    (10, ["Mechanical Maintenance", "Electrical Maintenance", "Utility (Generator/Boiler)"]),
    (11, ["Washing", "Dyeing"]),
    (12, ["Printing", "Embroidery"]),
    (13, ["Sample Section", "Pattern & CAD"]),
    (14, ["Gate Security", "CCTV Monitoring"]),
    (15, ["Finance & Accounts", "Admin & General Services"]),
]

ROLE_LEVELS = ["Helper", "Operator", "Senior Operator", "Quality Checker",
               "Line Supervisor", "Assistant In-charge", "Section In-charge"]


class Command(BaseCommand):
    help = "Seed RIZVIWORLD departments, sections, and designations (15 / 39 / 247)"

    def handle(self, *args, **options):
        dept_objs = {}
        for i, name in enumerate(DEPARTMENTS):
            obj, _ = Department.objects.get_or_create(name=name, defaults={"order": i})
            dept_objs[i + 1] = obj
        self.stdout.write(self.style.SUCCESS(f"Departments: {len(dept_objs)}"))

        sections = []
        for dept_num, names in SECTION_MAP:
            for j, name in enumerate(names):
                obj, _ = Section.objects.get_or_create(
                    department=dept_objs[dept_num], name=name, defaults={"order": j}
                )
                sections.append(obj)
        self.stdout.write(self.style.SUCCESS(f"Sections: {len(sections)}"))

        total, sec_count = 247, len(sections)
        base, remainder = total // sec_count, total % sec_count
        desig_count = 0
        for idx, sec in enumerate(sections):
            count = base + 1 if idx < remainder else base
            for r in range(count):
                Designation.objects.get_or_create(
                    section=sec, name=f"{sec.name} — {ROLE_LEVELS[r]}", defaults={"order": r}
                )
                desig_count += 1
        self.stdout.write(self.style.SUCCESS(f"Designations: {desig_count}"))
        self.stdout.write(self.style.SUCCESS("RIZVIWORLD seed complete."))
