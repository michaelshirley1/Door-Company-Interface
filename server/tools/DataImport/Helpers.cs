using System.Globalization;
using System.Text.RegularExpressions;
using ClosedXML.Excel;

namespace DataImport;

public static class Helpers
{
    public static readonly int[] StandardWidths = [360, 410, 460, 560, 610, 660, 710, 760, 810, 860, 910, 960, 1010, 1060];

    public static int Imported;
    public static int Updated;
    public static int Skipped;
    public static readonly List<string> Warnings = [];

    public static void Warn(string message)
    {
        Warnings.Add(message);
        Skipped++;
    }

    public static string CellText(IXLCell cell) => cell.GetValue<string>().Trim();

    /// <summary>Finds the header row in a sheet (the first row containing all of `mustContain`) and returns a column-name -> index map.</summary>
    public static Dictionary<string, int>? FindHeaderRow(IXLWorksheet sheet, out int headerRowNumber, params string[] mustContain)
    {
        headerRowNumber = -1;
        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 0;
        var lastCol = sheet.LastColumnUsed()?.ColumnNumber() ?? 0;

        for (int r = 1; r <= Math.Min(lastRow, 5); r++)
        {
            var cells = new List<string>();
            for (int c = 1; c <= lastCol; c++)
                cells.Add(CellText(sheet.Cell(r, c)).ToLowerInvariant());

            if (mustContain.All(need => cells.Any(c => c.Contains(need.ToLowerInvariant()))))
            {
                headerRowNumber = r;
                var map = new Dictionary<string, int>();
                for (int c = 1; c <= lastCol; c++)
                {
                    var name = CellText(sheet.Cell(r, c));
                    if (!string.IsNullOrWhiteSpace(name)) map[name] = c;
                }
                return map;
            }
        }
        return null;
    }

    public static double? FirstNumber(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var m = Regex.Match(raw, @"\d+(\.\d+)?");
        return m.Success ? double.Parse(m.Value, CultureInfo.InvariantCulture) : null;
    }

    /// <summary>
    /// "410-810mm" -> standard widths within [410,810]. "410,460,510,560" -> exactly those widths
    /// (used as-given, not filtered against StandardWidths — some source lists include non-standard
    /// values like 510 that are still real priced widths). A single value like "810" -> [810].
    /// </summary>
    public static List<int> ExpandWidths(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return [];
        var text = raw.Replace("mm", "", StringComparison.OrdinalIgnoreCase).Trim();

        if (text.Contains(','))
        {
            return text.Split(',')
                .Select(s => FirstNumber(s))
                .Where(n => n.HasValue)
                .Select(n => (int)n!.Value)
                .ToList();
        }

        var rangeMatch = Regex.Match(text, @"(\d+)\s*-\s*(\d+)");
        if (rangeMatch.Success)
        {
            var lo = int.Parse(rangeMatch.Groups[1].Value);
            var hi = int.Parse(rangeMatch.Groups[2].Value);
            var inRange = StandardWidths.Where(w => w >= lo && w <= hi).ToList();
            return inRange.Count > 0 ? inRange : [lo];
        }
        var single = FirstNumber(text);
        return single.HasValue ? [(int)single.Value] : [];
    }

    public static bool IsBlankRow(IXLWorksheet sheet, int row, int firstCol, int lastCol)
    {
        for (int c = firstCol; c <= lastCol; c++)
            if (!string.IsNullOrWhiteSpace(CellText(sheet.Cell(row, c)))) return false;
        return true;
    }
}
