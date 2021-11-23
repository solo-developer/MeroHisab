namespace MeroHisab.Core.Exceptions
{
    public class NonNullValueException : CustomException
    {
        public NonNullValueException(string message = "Value cannot be null") : base(message)
        {

        }
    }
}
