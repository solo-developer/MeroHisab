namespace MeroHisab.Core.Exceptions
{
    public class ItemNotFoundException : CustomException
    {
        public ItemNotFoundException(string message = "Item doesnot exist.") : base(message)
        {

        }
    }
}
