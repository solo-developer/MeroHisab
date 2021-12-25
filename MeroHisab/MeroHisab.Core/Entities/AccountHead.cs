using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class AccountHead : BaseEntity
    {
        public AccountHead()
        {

        }
        public AccountHead(string name, PayHeadType headType)
        {
            Name = name ?? throw new NonNullValueException();
            HeadType = headType;
        }
        public string Name { get; set; }
        public PayHeadType HeadType { get; set; }

        public bool IsEnabled { get; set; }

        public void Enable() => IsEnabled = true;
        public void Disable() => IsEnabled = false;

    }
}
