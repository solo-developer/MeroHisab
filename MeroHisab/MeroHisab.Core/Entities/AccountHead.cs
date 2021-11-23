using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class AccountHead : BaseEntity
    {
        public AccountHead(string name, PayHeadType headType)
        {
            Name = name ?? throw new NonNullValueException();
            HeadType = headType;
        }
        protected string Name { get; set; }
        protected PayHeadType HeadType { get; set; }

        protected bool IsEnabled { get; set; }

        public void Enable() => IsEnabled = true;
        public void Disable() => IsEnabled = false;

    }
}
