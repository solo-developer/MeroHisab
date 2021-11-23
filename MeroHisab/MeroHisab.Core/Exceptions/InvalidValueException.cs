namespace MeroHisab.Core.Exceptions
{
    public class InvalidValueException : CustomException
    {
        public InvalidValueException(string message = "The value provided is invalid") : base(message)
        {

        }
    }
}
