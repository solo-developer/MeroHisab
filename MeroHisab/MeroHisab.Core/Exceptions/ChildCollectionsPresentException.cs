namespace MeroHisab.Core.Exceptions
{
    public class ChildCollectionsPresentException : CustomException
    {
        public ChildCollectionsPresentException(string message = "Child collection is present for specified parent.") : base(message)
        {

        }
    }
}
