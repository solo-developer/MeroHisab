using MeroHisab.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace MeroHisab.Core.Dto
{
    public class AccountHeadDto
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Code { get; set; }
        public LedgerGroupType HeadType { get; set; }
        public LedgerType LedgerType { get; set; }
    }
}
