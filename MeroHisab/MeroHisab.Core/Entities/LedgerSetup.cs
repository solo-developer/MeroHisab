using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class LedgerSetup :BaseEntity
    {
        private string _key, _value;

        public string Key
        {
            get => _key;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    throw new NonEmptyValueException("Key is required.");
                }
                _key = value;
            }
        }

        public string Value
        {
            get => _value;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    throw new NonEmptyValueException("Value is required.");
                }
                _value = value;
            }
        }

    }
}
