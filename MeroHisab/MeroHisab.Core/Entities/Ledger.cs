using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class Ledger :BaseEntity
    {
        private string _name;

        public string Name
        {
            get => _name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new NonEmptyValueException("Ledger name cannot be empty.");
                _name = value;
            }
        }

        public string code { get; set; }
        public DateTime created_date { get; set; } = DateTime.Now;

        public bool IsCurrentlyUsed { get; set; } = false;

    }
}
