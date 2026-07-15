namespace BusinessApi.Models
{
    /// <summary>
    /// Backs atomic sequential number generation per document type (see IDocumentNumberService) —
    /// e.g. Key="Job" tracks the next JOB-XXXX value. One row per key, created on first use. Not
    /// exposed via any controller.
    /// </summary>
    public class DocumentSequence
    {
        public string Key { get; set; } = string.Empty;
        public int NextValue { get; set; } = 1;
    }
}
