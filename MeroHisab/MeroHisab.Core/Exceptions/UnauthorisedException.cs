namespace MeroHisab.Core.Exceptions
{
    public class UnauthorisedException : CustomException
    {
        public UnauthorisedException(string message = "You are not allowed to perform this operation.") : base(message)
        {

        }
    }
}
