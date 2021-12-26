using MeroHisab.Core.Enums;

namespace MeroHisab.Core.Dto
{
    public class AccountHeadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public PayHeadType HeadType { get; set; }
        public LedgerType LedgerType { get; set; }
    }
}
