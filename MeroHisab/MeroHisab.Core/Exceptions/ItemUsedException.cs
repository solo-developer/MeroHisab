namespace MeroHisab.Core.Exceptions
{
    public class ItemUsedException : CustomException
    {
        public ItemUsedException(string message = "Specified item has already been used.") : base(message)
        {

        }
    }
}
