using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class AccountSettings : BaseEntity
    {
        public AccountSettings()
        {

        }
        public AccountSettings(string key, long value)
        {
            this.Key = key ?? throw new NonNullValueException();
        }
        public string Key { get; set; }

        public long Value { get; set; }
    }
}
