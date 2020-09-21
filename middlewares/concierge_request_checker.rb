module ConciergeRequestChecker
  class RequestSignatureError < StandardError; end

  def signed_request!(env)
    raise RequestSignatureError unless check_signature(env)
  end

  private

  def request(env)
    Rack::Request.new(env)
  end

  def check_signature(env)
    ApiAuth.authentic?(request(env), ENV['CONCIERGE_POSTBACK_SECRET_KEY'])
  end
end