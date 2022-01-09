using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class AccountHead : BaseEntity
    {
        public AccountHead()
        {

        }
        public AccountHead(string name, LedgerGroupType headType,LedgerType ledgerType)
        {
            Name = name ?? throw new NonNullValueException();
            HeadType = headType;
            LedgerType = ledgerType;
        }
        public string Name { get; set; }

        public string Code { get; set; }
        public LedgerGroupType HeadType { get; set; }

        public LedgerType LedgerType { get; set; }

        public bool IsEnabled { get; set; } = true;

        public void Enable() => IsEnabled = true;
        public void Disable() => IsEnabled = false;

    }
}
