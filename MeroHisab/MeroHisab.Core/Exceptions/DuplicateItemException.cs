namespace MeroHisab.Core.Exceptions
{
    public class DuplicateItemException : CustomException
    {
        public DuplicateItemException(string message = "Item already exists.") : base(message)
        {

        }
    }
}
